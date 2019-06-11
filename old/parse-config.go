package bot

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/BurntSushi/toml"
	"github.com/netlify/netlify-commons/ntoml"
	"github.com/pkg/errors"
)

const netlifyFileName = "netlify.toml"

type extendedToml struct {
	Settings ntoml.Settings `toml:"settings"`

	Redirects []ntoml.Redirect `toml:"redirects, omitempty"`

	// this is the default context
	Build   *extendedBuildConfig           `toml:"build"`
	Context map[string]extendedBuildConfig `toml:"context, omitempty"`
}

type extendedBuildConfig struct {
	ntoml.BuildConfig
	Functions string `toml:"functions"`
}

func tomlPath(base string) string {
	return filepath.Join(base, netlifyFileName)
}

func (b *Builder) consumeBuildConfig() error {
	buildConfig, err := chooseBuildConfig(b)
	if err != nil {
		return err
	}

	if b.DeployDir != buildConfig.Publish {
		b.ClientLog.Infof("Different publish path detected, going to use the one specified in the toml file: '%s' versus '%s' in the site", buildConfig.Publish, b.DeployDir)
		b.DeployDir = buildConfig.Publish // make us deploy the right directory
	}
	if b.Cmd != buildConfig.Command {
		b.ClientLog.Infof("Different build command detected, going to use the one specified in the toml file: '%s' versus '%s' in the site", buildConfig.Command, b.Cmd)
		b.Cmd = buildConfig.Command
	}

	if b.FunctionsDir != buildConfig.Functions {
		b.ClientLog.Infof("Different functions path detected, going to use the one specified in the toml file: '%s' versus '%s' in the site", buildConfig.Functions, b.FunctionsDir)
		b.FunctionsDir = buildConfig.Functions
	}

	if b.BuildDir != buildConfig.Base {
		b.ClientLog.Infof("Different base path detected, going to use the one specified in the toml file: '%s' versus '%s' in the site", buildConfig.Base, b.BuildDir)
		b.BuildDir = buildConfig.Base
	}

	b.Env = buildEnvironment(b.head, b.CmdData, b.Env)

	return nil
}

func defaultBuildConfig(b *Builder) *extendedBuildConfig {
	return &extendedBuildConfig{
		BuildConfig: ntoml.BuildConfig{
			Command:     b.Cmd,
			Base:        b.BuildDir,
			Publish:     b.DeployDir,
			Environment: b.Env,
		},
		Functions: b.FunctionsDir,
	}
}

func chooseBuildConfig(b *Builder) (*extendedBuildConfig, error) {
	dc := defaultBuildConfig(b)
	var paths []string
	if b.BuildDir == "" {
		paths = append(paths, filepath.Join(b.paths.repo, b.BuildDir, netlifyFileName))
	}
	paths = append(paths, filepath.Join(b.paths.repo, netlifyFileName))

	toml, err := load(paths...)
	if err != nil {
		if os.IsNotExist(err) {
			return dc, nil
		}
		return nil, err
	}

	b.ClientLog.Infof("Found netlify.toml. Overriding site configuration")
	buildConfig, err := chooseConfig(toml, b.HeadBranch, b.Context)
	if err != nil {
		return nil, err
	}

	if buildConfig != nil {
		mergeConfig(dc, buildConfig)
	}

	return dc, nil
}

func load(paths ...string) (*extendedToml, error) {
	out := new(extendedToml)

	for _, p := range paths {
		if data, ferr := ioutil.ReadFile(p); !os.IsNotExist(ferr) {
			if ferr != nil {
				return nil, errors.Wrapf(ferr, "Error while reading in file %s.", p)
			}

			if _, derr := toml.Decode(string(data), out); derr != nil {
				return nil, errors.Wrapf(derr, "Error while decoding file %s", p)
			}

			return out, nil
		}
	}

	return nil, os.ErrNotExist
}

func chooseConfig(toml *extendedToml, branch, context string) (*extendedBuildConfig, error) {
	configsToMerge := []*extendedBuildConfig{}
	if toml.Context != nil {
		if s, ok := toml.Context[context]; ok {
			configsToMerge = append(configsToMerge, &s)
		}

		if s, ok := toml.Context[branch]; ok {
			configsToMerge = append(configsToMerge, &s)
		}
	}

	if len(configsToMerge) != 0 {
		if toml.Build == nil {
			toml.Build = new(extendedBuildConfig)
		}

		for _, c := range configsToMerge {
			mergeConfig(toml.Build, c)
		}
	}

	if toml.Build == nil {
		return nil, nil
	}

	return cleanBuildConfig(toml.Build)
}

func mergeConfig(final, over *extendedBuildConfig) {
	if final == nil || over == nil {
		return
	}

	if over.Command != "" {
		final.Command = over.Command
	}
	if over.Base != "" {
		final.Base = over.Base
	}
	if over.Publish != "" {
		final.Publish = over.Publish
	}

	if over.Functions != "" {
		final.Functions = over.Functions
	}
	if over.Environment != nil {
		if final.Environment == nil {
			final.Environment = make(map[string]string)
		}
		for k, v := range over.Environment {
			value := strings.TrimSpace(v)
			if len(value) > 0 {
				final.Environment[k] = value
			}
		}
	}
}

func cleanBuildConfig(config *extendedBuildConfig) (*extendedBuildConfig, error) {
	if config == nil {
		return nil, nil
	}

	if invalidRelDirectory(config.Base) {
		return nil, fmt.Errorf("Invalid base directory: %s", config.Base)
	}

	if invalidRelDirectory(config.Publish) {
		return nil, fmt.Errorf("Invalid publish directory: %s", config.Publish)
	}

	if invalidRelDirectory(config.Functions) {
		return nil, fmt.Errorf("Invalid functions directory: %s", config.Functions)
	}

	return config, nil
}

func invalidRelDirectory(path string) bool {
	return path != "" && strings.Contains(path, "..")
}

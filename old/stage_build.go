package bot

import (
	"context"
	"io/ioutil"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/netlify/buildbot/messages"
	"github.com/netlify/buildbot/shell"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

func (b *Builder) newBuildSiteStage() buildStage {
	s := buildStage{
		Name:         "build_site",
		Description:  "building site",
		Message:      "Failed to build site",
		AllowFailure: false,
		FailBuild:    true,
		RunFunc:      b.runUserCommand,
	}
	return s
}

// runUserCommand runs a build container with the configuration for the site.
// It overrides the command and base directory for the site if
// a file called `netlify.toml` exists in the base of the repository
// after checking out the build branch. It will return the build configuration
func (b *Builder) runUserCommand(ctx context.Context) error {
	if err := b.consumeBuildConfig(); err != nil {
		b.ClientLog.WithError(err).Errorf("Invalid netlify.toml file: %v", err)
		return userBuildError{err}
	}

	if b.Cmd == "" {
		b.ClientLog.Info("No build command found, continuing to publishing")
		return b.checkForDeployDir()
	}

	if b.FunctionsDir != "" {
		// Fail build if prohibited ENV vars for functions are found
		if err := checkForBadEnv(b.Env); err != nil {
			return err
		}
	}

	// Prepare zip-it-and-ship-it packaging
	var absFuncPath string // Zero values prevent zip-it-and-ship-it from running
	var zisiTmpDir string
	if b.FunctionsDir != "" {
		b.ClientLog.Info("Creating functions prep folder")
		absFuncPath = filepath.Join(b.paths.repo, b.FunctionsDir)
		tmpDir, err := ioutil.TempDir("", "zisi-")
		if err != nil {
			b.SysLog.WithError(err).Errorf("Failed to create temporary directory")
			return err
		}
		if err := os.Chmod(tmpDir, 0777); err != nil {
			b.SysLog.WithError(err).Errorf("Failed to set permissions on temporary directory")
			return err
		}
		b.paths.preparedFunctions = tmpDir // Attach prepared functions directory to builder
		zisiTmpDir = tmpDir
	}

	b.ClientLog.WithFields(logrus.Fields{
		"cmd":    b.Cmd,
		"gitref": b.GitRef(),
		"head":   b.head,
	}).Infof("Starting build script")

	fields := shell.ScriptFields{
		RubyVersion:  b.Versions.RubyVersion,
		NodeVersion:  b.Versions.NodeVersion,
		YarnVersion:  b.Versions.YarnVersion,
		BuildCmd:     b.Cmd,
		BuildDir:     filepath.Join(b.paths.repo, b.BuildDir),
		FunctionsDir: absFuncPath,
		ZisiTempDir:  zisiTmpDir,
	}

	err := shell.Run(
		b.ctx,
		b.paths.root,
		fields,
		time.Duration(b.TimeLimit)*time.Second,
		buildEnvironment(b.head, b.CmdData, b.Env),
		b.LogPair,
		"/usr/local/bin/build",
		[]string{fields.BuildDir, fields.NodeVersion, fields.RubyVersion, fields.YarnVersion, fields.BuildCmd, fields.FunctionsDir, fields.ZisiTempDir},
		"Build",
		"build_command",
	)
	if err != nil {
		b.ClientLog.WithError(err).Errorf("Error running command: %v", err)
		return userBuildError{err}
	}

	return b.checkForDeployDir()
}

func (b *Builder) checkForDeployDir() error {
	// Ensure deploy directory gets created, otherwise fail the build
	absFilePath := filepath.Join(b.paths.repo, b.DeployDir)
	if stat, serr := os.Stat(absFilePath); serr != nil {
		if os.IsNotExist(serr) {
			return userBuildError{errors.Errorf("Deploy directory '%s' does not exist", b.DeployDir)}
		}
		return errors.Wrap(serr, "Error checking for deploy directory")
	} else if !stat.IsDir() {
		return userBuildError{errors.Errorf("Deploy directory '%s' is not a directory", b.DeployDir)}
	}
	return nil
}

// buildEnvironment adds some variables to the docker Runtime
func buildEnvironment(head string, d *messages.CmdData, defaultEnv map[string]string) map[string]string {
	env := defaultEnv
	if env == nil {
		env = make(map[string]string)
	}

	url := d.RepoURL
	if d.RepoURLAfter != "" {
		url = d.RepoURLAfter
	}

	if _, ok := env["YARN_VERSION"]; !ok {
		env["YARN_VERSION"] = d.Versions.YarnVersion
	}

	if _, ok := env["RUBY_VERSION"]; !ok {
		env["RUBY_VERSION"] = d.Versions.RubyVersion
	}

	if _, ok := env["NODE_VERSION"]; !ok {
		env["NODE_VERSION"] = d.Versions.NodeVersion
	}

	env["COMMIT_REF"] = head
	env["REPOSITORY_URL"] = url
	env["BRANCH"] = d.Branch
	env["PULL_REQUEST"] = strconv.FormatBool(d.PullRequest)
	env["DEPLOY_ID"] = d.DeployID
	env["BUILD_ID"] = d.BuildID
	env["HEAD"] = d.HeadBranch
	env["CONTEXT"] = d.Context

	return env
}

func checkForBadEnv(env map[string]string) error {
	for k := range env {
		if envBlacklist[k] {
			return errors.Errorf("Environment variable '%s' isn't available for direct interaction", k)
		}
		if match := startsWithalphaOnly(k); !match {
			return errors.Errorf("Environment variable key '%s' must start with a letter", k)
		}
		if match := alphaNumericUnderscoreOnly(k); !match {
			return errors.Errorf("Environment variable keys '%s' must consist of alphanumeric or underscore characters", k)
		}
		// TODO: re-enable 4k limit once https://github.com/netlify/buildbot/issues/376 is sorted out
	}
	return nil
}

var envBlacklist = map[string]bool{
	"AWS_REGION":                      true,
	"AWS_EXECUTION_ENV":               true,
	"AWS_LAMBDA_FUNCTION_NAME":        true,
	"AWS_LAMBDA_FUNCTION_MEMORY_SIZE": true,
	"AWS_LAMBDA_FUNCTION_VERSION":     true,
	"AWS_LAMBDA_LOG_GROUP_NAME":       true,
	"AWS_LAMBDA_LOG_STREAM_NAME":      true,
	"AWS_ACCESS_KEY":                  true,
	"AWS_ACCESS_KEY_ID":               true,
	"AWS_SECRET_KEY":                  true,
	"AWS_SECRET_ACCESS_KEY":           true,
	"AWS_SESSION_TOKEN":               true,
	"AWS_LAMBDA_RUNTIME_API":          true,
}

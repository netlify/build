package shell

import (
	"context"
	"os"
	"os/exec"
	"os/user"
	"strconv"
	"syscall"
	"time"

	"github.com/netlify/buildbot/logger"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

var (
	defaultTimeout = time.Minute * 15
)

type ScriptFields struct {
	BuildDir     string
	BuildCmd     string
	RubyVersion  string
	NodeVersion  string
	YarnVersion  string
	FunctionsDir string
	ZisiTempDir  string
}

// Run will execute the a command in a shell
func Run(
	ctx context.Context,
	rootDir string,
	fields ScriptFields,
	timeout time.Duration,
	env map[string]string,
	lp logger.LogPair,
	command string,
	args []string,
	stageName string,
	stageField string) error {
	if timeout.Seconds() == 0 {
		timeout = defaultTimeout
	}

	lp.SysLog.WithFields(logrus.Fields{
		"root_dir":      rootDir,
		"node_version":  fields.NodeVersion,
		"ruby_version":  fields.RubyVersion,
		"yarn_version":  fields.YarnVersion,
		"build_dir":     fields.BuildDir,
		"command":       fields.BuildCmd,
		"functions_dir": fields.FunctionsDir,
		"zisi_temp_dir": fields.ZisiTempDir,
	}).Info("Starting shell run")

	cmdEnv := []string{"HOME=/opt/buildhome"}
	passthroughEnv := []string{"PATH", "LANGUAGE", "LANG", "LC_ALL", "GOPATH", "GOCACHE", "GIMME_GO_VERSION", "GIMME_ENV_PREFIX"}
	for _, e := range passthroughEnv {
		cmdEnv = append(cmdEnv, e+"="+os.Getenv(e))
	}

	envFields := make(logrus.Fields)
	for key, value := range env {
		cmdEnv = append(cmdEnv, key+"="+value)
		envFields[key] = value
	}
	cmdEnv = append(cmdEnv, "NETLIFY_BUILD_BASE="+rootDir)

	lp.SysLog.WithFields(envFields).Debug("Prepare " + stageName + " command")
	cmdLog := lp.ClientLog.WithField(stageField, true)

	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	// cmd := exec.CommandContext(ctx, "/usr/local/bin/build", fields.BuildDir, fields.NodeVersion, fields.RubyVersion, fields.YarnVersion, fields.BuildCmd)
	cmd := exec.CommandContext(ctx, command, args...)
	cmd.Env = cmdEnv
	cmd.Dir = fields.BuildDir

	// logger.IOAdapter is not ideal because it does not join lines across
	// Write calls. It does handle the case of progress output with a lot of
	// \r characters well though.
	cmd.Stdout = logger.IOAdapter{Logger: cmdLog}
	cmd.Stderr = cmd.Stdout

	// setup command to run as buildbot user
	buser, err := user.Lookup("buildbot")
	if err != nil {
		return errors.Wrap(err, "Unable to lookup buildbot user")
	}
	uid, err := strconv.Atoi(buser.Uid)
	if err != nil {
		return errors.Wrap(err, "error converting uid to int")
	}
	gid, err := strconv.Atoi(buser.Gid)
	if err != nil {
		return errors.Wrap(err, "error converting gid to int")
	}

	cmd.SysProcAttr = &syscall.SysProcAttr{
		Credential: &syscall.Credential{
			Uid: uint32(uid),
			Gid: uint32(gid),
		},
	}

	lp.SysLog.Infof("Start %s command", stageName)
	err = cmd.Run()

	if ctx.Err() == context.DeadlineExceeded {
		cmdLog.Infof("Execution timed out after %s", timeout)
		return errors.New("Command did not finish within the time limit")
	} else if ctx.Err() == context.Canceled {
		cmdLog.Infof("Execution cancelled")
		return errors.New("Command was cancelled")
	}

	exitCode := 0
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.Sys().(interface {
				ExitStatus() int
			}).ExitStatus()
		} else {
			cmdLog.Infof("%s command unable to start", stageName)
			return err
		}
	}

	if exitCode == 0 {
		cmdLog.Infof("%s script success", stageName)
	} else {
		return errors.Errorf("%s script returned non-zero exit code: %d", stageName, exitCode)
	}
	return err
}

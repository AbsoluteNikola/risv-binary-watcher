package go_analyzer

import (
	"os/exec"
	"regexp"
	"strings"
)

func getNodeFromPackage(projectPath string, packageName string, counter *int) (*Node, *[]string) {
	goListResponse := RunGoList(projectPath, packageName)

	if goListResponse == "" {
		return getLeafNode(counter, packageName), &[]string{}
	}

	imports := strings.Split(goListResponse, " ")

	if packageName == "" {
		packageName = GetModuleName(projectPath)
	}

	return createNode(counter, packageName), &imports
}

func RunGoList(projectPath string, packageName string) string {
	cmd := exec.Command(
		"go",
		"list",
		"-f",
		"'{{ .Imports }}'",
		packageName)
	cmd.Dir = projectPath
	stdout, err := cmd.Output()
	if err != nil {
		return "" //TODO: Error handling need to be reworked
	}

	var response = string(stdout)
	response = regexp.MustCompile(`[\[\]'\n]+`).ReplaceAllString(response, "")

	return response
}

func GetModuleName(projectPath string) string {
	cmd := exec.Command(
		"go",
		"list",
		"-m")
	cmd.Dir = projectPath
	stdout, err := cmd.Output()
	if err != nil {
		return "" //TODO: Error handling need to be reworked
	}

	return string(stdout)[:len(string(stdout))-1]
}

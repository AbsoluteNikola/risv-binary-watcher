package go_analyzer

import (
	"fmt"
	"os/exec"
	"regexp"
	"strings"
)

func getNodeFromPackage(projectPath string, packageName string, counter *int) (*Node, *[]string) {
	if packageName == "" {
		packageName = GetModuleName(projectPath)
	}

	goListResponse := RunGoList(projectPath, packageName)

	fmt.Println(goListResponse)

	if goListResponse == "" {
		return getLeafNode(counter, packageName), &[]string{}
	}

	imports := strings.Split(goListResponse, " ")

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

package go_analyzer

import (
	"fmt"
	"os/exec"
	"strings"
)

func getNodeFromPackage(projectPath string, packageName string, counter *int) (*Node, *[]string) {
	if packageName == "" {
		packageName = GetModuleName(projectPath)
	}

	goListResponseBracked := RunGoList(projectPath, packageName)

	fmt.Println(goListResponseBracked)

	if goListResponseBracked == "" {
		return getLeafNode(counter, packageName), &[]string{}
	}

	goListResponse := goListResponseBracked[1 : len(goListResponseBracked)-1]

	imports := strings.Split(goListResponse, " ")

	fmt.Println(imports)

	return createNode(*counter, packageName), &imports
}

func RunGoList(projectPath string, packageName string) string {
	fmt.Println("ProjPath = " + projectPath)
	fmt.Println("PackageName = " + packageName)
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

	return string(stdout)
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

	return string(stdout)
}

package main

import (
	"os/exec"
	"strings"
)

func getNodeFromRpm(packageName string, counter *int) (*node, *[]string) {
	rpmResponse := runRpm(packageName)

	if rpmResponse == "" {
		return getLeafNode(counter, packageName), &[]string{}
	}

	requirements := strings.Split(rpmResponse, "\n")

	packageInfo := requirements[0]
	node := getNodeFromRpmInfo(counter, packageInfo)

	var filtered []string
	for _, element := range requirements[1:] {
		if !strings.Contains(element, "/") &&
			!strings.Contains(element, "(") &&
			element != "" {
			elementParts := strings.SplitN(element, " ", 2)

			filtered = append(filtered, elementParts[0])
		}
	}

	return node, &filtered
}

func runRpm(packageName string) string {
	cmd := exec.Command(
		"rpm",
		"--query",
		"--queryformat",
		"[%{name} %{version} %{size} %{installtime:date}\n]",
		"--requires",
		packageName)
	stdout, err := cmd.Output()
	if err != nil {
		return ""
	}

	return string(stdout)
}

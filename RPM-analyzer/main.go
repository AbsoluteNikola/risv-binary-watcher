package main

import (
	"binary_watcher/internal/go_analyzer"
	"binary_watcher/internal/rpm_analyzer"
	"fmt"
	"os"
)

func main() {
	goAnalyzerCli()
}

func rpmAnalyzerCli() {
	args := os.Args[1:]

	if len(args) != 2 {
		fmt.Println("expected path to RPM file and path to directory where output file will be saved")
		return
	}

	rpmPackageName := args[0]
	outputDirPath := args[1]

	fmt.Println("Arguments: ", rpmPackageName, outputDirPath)

	outputDirInfo, err := os.Stat(outputDirPath)
	if os.IsNotExist(err) || !outputDirInfo.IsDir() {
		fmt.Println("incorrect path to directory for output file")
		return
	}
	node := rpm_analyzer.BuildGraph(rpmPackageName)

	if node != nil {
		rpm_analyzer.Print(node)
	}
}

func goAnalyzerCli() {
	args := os.Args[1:]

	if len(args) != 1 {
		fmt.Println("expected path to project's directory")
		return
	}

	projectPath := args[0]

	projectPathInfo, err := os.Stat(projectPath)
	if os.IsNotExist(err) || !projectPathInfo.IsDir() {
		fmt.Println("incorrect path to project's directory")
		return
	}

	node := go_analyzer.BuildGraph(projectPath)

	if node != nil {
		go_analyzer.Print(node)
	}
}

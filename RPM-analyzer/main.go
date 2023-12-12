package main

import (
	"binary_watcher/internal/go_module_analyzer"
	"binary_watcher/internal/go_package_analyzer"
	"binary_watcher/internal/rpm_analyzer"
	"fmt"
	"os"
)

func main() {
	commonCli()
}

const rpm = "rpm"
const goImports = "imports"
const goModules = "modules"

func commonCli() {
	if len(os.Args) == 0 {
		fmt.Println("Specify run parameter. Use --help for more info")
		return
	}

	if len(os.Args) == 0 {
		fmt.Println("Specify run parameter. Use --help for more info")
		return
	}

	args := os.Args[1]
	otherArgs := os.Args[2:]
	switch args {
	case "help":
		help()
	case rpm:
		rpmAnalyzerCli(otherArgs)
	case goImports:
		goImportAnalyzerCli(otherArgs)
	case goModules:
		goModulesAnalyzerCli(otherArgs)
	default:
		fmt.Println("Incorrect run parameter")
	}
}

func rpmAnalyzerCli(args []string) {
	if len(args) != 2 {
		fmt.Println("Expected path to RPM file and path to directory where output file will be saved")
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

func goImportAnalyzerCli(args []string) {
	if len(args) != 1 {
		fmt.Println("Expected path to project's directory")
		return
	}

	projectPath := args[0]

	projectPathInfo, err := os.Stat(projectPath)
	if os.IsNotExist(err) || !projectPathInfo.IsDir() {
		fmt.Println("incorrect path to project's directory")
		return
	}

	node := go_package_analyzer.BuildGraph(projectPath)

	if node != nil {
		go_package_analyzer.Print(node)
	}
}

func goModulesAnalyzerCli(args []string) {
	if len(args) != 1 {
		fmt.Println("Expected root directory of go projects")
		return
	}

	rootPath := args[0]

	projectPathInfo, err := os.Stat(rootPath)
	if os.IsNotExist(err) || !projectPathInfo.IsDir() {
		fmt.Println("incorrect path to root directory of go projects")
		return
	}

	modules := go_module_analyzer.GetModules(rootPath)

	if modules == nil {
		return
	}

	go_module_analyzer.Print(modules)
}

func help() {
	fmt.Println("Select required mod:\n" +
		fmt.Sprintf("1. Analyze RPM packages dependencies (%s)\n", rpm) +
		fmt.Sprintf("2. Analyze go module package imports (%s)\n", goImports) +
		fmt.Sprintf("3. Analyze go module info (%s)\n", goModules))
}

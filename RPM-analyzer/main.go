package main

import (
	"fmt"
	"os"
)

func main() {
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
	node := buildGraph(rpmPackageName)

	if node != nil {
		printNode(node)
	}
}

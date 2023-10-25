package main

import (
	"fmt"
	"os"
	"path"
)

func main() {
	args := os.Args[1:]

	if len(args) != 2 {
		fmt.Println("expected path to RPM file and path to directory where output file will be saved")
		return
	}

	rpmFilePath := args[0]
	outputDirPath := args[1]

	rpmFileInfo, err := os.Stat(rpmFilePath)
	if os.IsNotExist(err) || rpmFileInfo.IsDir() || path.Ext(rpmFilePath) != ".rpm" {
		fmt.Println("incorrect path to RPM file")
		return
	}

	outputDirInfo, err := os.Stat(outputDirPath)
	if os.IsNotExist(err) || !outputDirInfo.IsDir() {
		fmt.Println("incorrect path to directory for output file")
		return
	}

	//TODO: call "rpm -qpR {rpmFilePath}" and get dependencies
	//TODO: transform dependencies to machine-readable file for frontend
	//TODO: put the file in outputDirPath

	fmt.Println(args)
}

package main

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
)

type node struct {
	id           int
	name         string
	version      string
	requirements []*node
}

func (p *node) AddRequirement(c *node) {
	p.requirements = append((*p).requirements, c)
}

func createNode(id int, name string, version string) *node {
	p := new(node)
	p.id = id
	p.name = name
	p.version = version
	p.requirements = []*node{}

	return p
}

func main() {
	args := os.Args[1:]

	if len(args) != 2 {
		fmt.Println("expected path to RPM file and path to directory where output file will be saved")
		return
	}

	rpmPackageName := args[0]
	outputDirPath := args[1]

	fmt.Println(rpmPackageName, outputDirPath)

	//TODO: check that rpm package is installed

	outputDirInfo, err := os.Stat(outputDirPath)
	if os.IsNotExist(err) || !outputDirInfo.IsDir() {
		fmt.Println("incorrect path to directory for output file")
		return
	}

	//TODO: call "rpm -qpR {rpmFilePath}" and get dependencies
	//TODO: transform dependencies to machine-readable file for frontend
	//TODO: put the file in outputDirPath

	node := buildGraph(rpmPackageName)

	printNode(node)
}

func buildGraph(rpmPackageName string) *node {
	counter := 1
	headNode := createNode(counter, rpmPackageName, "")

	buildGraphRec(headNode, 0, &map[string]int{}, &counter)

	return headNode
}

func buildGraphRec(packageNode *node, depth int, seen *map[string]int, counter *int) {
	var nodeName = packageNode.name
	_, ok := (*seen)[nodeName]
	if ok {
		return
	}
	(*seen)[nodeName] = 1

	cmd := exec.Command("rpm", "--query", "--requires", nodeName)
	stdout, err := cmd.Output()
	if err != nil {
		return
	}

	rpmResponse := string(stdout)
	requirements := getPackageRequirements(rpmResponse)
	for _, element := range *requirements {
		*counter++
		name, version := getPackageNameAndVersion(element)
		requiredNode := createNode(*counter, name, version)

		packageNode.AddRequirement(requiredNode)
		buildGraphRec(requiredNode, depth + 1, seen, counter)
	}
}

func getPackageRequirements(rpmStdout string) *[]string {
	requirements := strings.Split(rpmStdout, "\n")

	var filtered []string
	for _, element := range requirements {
		if !strings.Contains(element, "/") &&
			!strings.Contains(element, "(") &&
			element != "" {
			filtered = append(filtered, element)
		}
	}

	return &filtered
}

func getPackageNameAndVersion(requirement string) (string, string) {
	requirementParts := strings.SplitN(requirement, " ", 2)

	if len(requirementParts) == 1 {
		return requirement, ""
	}

	return requirementParts[0], requirementParts[1]
}

func printNode(head *node) {
	fmt.Printf("Id: %d, Name: %s, Version: %s", head.id, head.name, head.version)
	fmt.Printf(" Req: ")
	for _, req := range head.requirements {
		fmt.Printf("%d ", req.id)
	}
	fmt.Println()

	for _, child := range head.requirements {
		printNode(child)
	}
}

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
	size         string
	installDate  string
	requirements []*node
}

func (p *node) AddRequirement(c *node) {
	p.requirements = append((*p).requirements, c)
}

func createNode(id int, name string, version string, size string, installDate string) *node {
	p := new(node)
	p.id = id
	p.name = name
	p.version = version
	p.size = size
	p.installDate = installDate
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

func buildGraph(rpmPackageName string) *node {
	counter := 0
	seen := map[string]*node{}
	depth := 0

	return buildGraphRec(rpmPackageName, depth, &seen, &counter)
}

func buildGraphRec(packageName string, depth int, seen *map[string]*node, counter *int) *node {
	if depth > 5 {
		return nil
	}

	processedNode, ok := (*seen)[packageName]
	if ok {
		return processedNode
	}

	node, requirements := getNodeFromRpm(packageName, counter)
	if node == nil || requirements == nil {
		return node
	}

	(*seen)[packageName] = node

	for _, element := range *requirements {
		child := buildGraphRec(element, depth+1, seen, counter)

		if child != nil {
			node.AddRequirement(child)
		}
	}

	return node
}

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

func getLeafNode(counter *int, packageName string) *node {
	*counter++
	return createNode(*counter, packageName, "", "", "")
}

func getNodeFromRpmInfo(counter *int, requirement string) *node {
	if requirement == "" {
		return nil
	}

	requirementParts := strings.SplitN(requirement, " ", 4)

	*counter++
	return createNode(
		*counter,
		requirementParts[0],
		requirementParts[1],
		requirementParts[2],
		requirementParts[3])
}

func printNode(head *node) {
	printNodeRec(head, &map[string]int{})
}

func printNodeRec(head *node, seen *map[string]int) {
	_, ok := (*seen)[head.name]
	if ok {
		return
	}
	(*seen)[head.name] = 1

	fmt.Printf("Id: %d, Name: %s, Version: %s", head.id, head.name, head.version)
	fmt.Printf(" Req: ")
	for _, req := range head.requirements {
		fmt.Printf("%d ", req.id)
	}
	fmt.Println()

	for _, child := range head.requirements {
		printNodeRec(child, seen)
	}
}

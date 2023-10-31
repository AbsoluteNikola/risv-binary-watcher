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
	requirements []*node
}

func (p *node) AddRequirement(c *node) {
	p.requirements = append((*p).requirements, c)
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

	fmt.Println(node)
}

func buildGraph(rpmPackageName string) node {
	counter := 1
	headNode := node{
		id:           counter,
		name:         rpmPackageName,
		requirements: []*node{},
	}

	fmt.Println(headNode)
	buildGraphRec(&headNode, 0, &map[string]int{}, &counter)

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

	stringRequirements := string(stdout)
	fmt.Println(stringRequirements)
	for _, element := range strings.Split(stringRequirements, "\n") {
		if strings.Contains(element, "/") || element == "" {
			continue
		}

		*counter++
		requiredNode := &node{
			id:           *counter,
			name:         element,
			requirements: []*node{},
		}
		fmt.Println(requiredNode)

		packageNode.AddRequirement(requiredNode)
		buildGraphRec(requiredNode, depth+1, seen, counter)
	}
}

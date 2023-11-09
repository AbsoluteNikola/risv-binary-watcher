package main

import (
	"fmt"
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

func (p *node) addRequirement(c *node) {
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
			node.addRequirement(child)
		}
	}

	return node
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
	fmt.Println(serializeNodeToJson(head))
}

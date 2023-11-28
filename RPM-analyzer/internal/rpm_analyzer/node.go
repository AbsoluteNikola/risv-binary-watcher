package rpm_analyzer

import (
	"fmt"
	"strings"
)

type Node struct {
	id           int
	name         string
	version      string
	size         string
	installDate  string
	requirements []*Node
}

func BuildGraph(rpmPackageName string) *Node {
	counter := 0
	seen := map[string]*Node{}
	depth := 0

	return buildGraphRec(rpmPackageName, depth, &seen, &counter)
}

func PrintNode(head *Node) {
	fmt.Println(serializeNodeToJson(head))
}

func createNode(id int, name string, version string, size string, installDate string) *Node {
	p := new(Node)
	p.id = id
	p.name = name
	p.version = version
	p.size = size
	p.installDate = installDate
	p.requirements = []*Node{}

	return p
}

func buildGraphRec(packageName string, depth int, seen *map[string]*Node, counter *int) *Node {
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

func getNodeFromRpmInfo(counter *int, requirement string) *Node {
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

func (p *Node) addRequirement(c *Node) {
	p.requirements = append((*p).requirements, c)
}

func getLeafNode(counter *int, packageName string) *Node {
	*counter++
	return createNode(*counter, packageName, "", "", "")
}

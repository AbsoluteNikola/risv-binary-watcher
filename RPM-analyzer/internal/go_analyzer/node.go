package go_analyzer

import (
	"fmt"
	"strings"
)

type Node struct {
	id          int
	packageName string
	imports     []*Node
}

func BuildGraph(projectPath string) *Node {
	counter := 0
	seen := map[string]*Node{}

	moduleName := GetModuleName(projectPath)

	return buildGraphRec("", moduleName, projectPath, &seen, &counter)
}

func Print(head *Node) {
	fmt.Println(serializeNodeToJson(head))
}

func createNode(counter *int, packageName string) *Node {
	*counter++

	p := new(Node)
	p.id = *counter
	p.packageName = packageName
	p.imports = []*Node{}

	return p
}

func buildGraphRec(packageName string, moduleName string, projectPath string, seen *map[string]*Node, counter *int) *Node {
	processedNode, ok := (*seen)[packageName]
	if ok {
		return processedNode
	}

	if packageName != "" && !strings.HasPrefix(packageName, moduleName) {
		leaf := getLeafNode(counter, packageName)
		(*seen)[packageName] = leaf

		return leaf
	}

	node, imports := getNodeFromPackage(projectPath, packageName, counter)
	if node == nil || imports == nil {
		return node
	}

	(*seen)[packageName] = node

	for _, element := range *imports {
		child := buildGraphRec(element, moduleName, projectPath, seen, counter)

		if child != nil {
			node.addImport(child)
		}
	}

	return node
}

func (p *Node) addImport(c *Node) {
	p.imports = append((*p).imports, c)
}

func getLeafNode(counter *int, packageName string) *Node {
	return createNode(counter, packageName)
}

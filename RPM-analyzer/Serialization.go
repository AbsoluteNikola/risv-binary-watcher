package main

import (
	"encoding/json"
	"fmt"
)

type nodeModel struct {
	Id           int
	Name         string
	Version      string
	Size         string
	InstallDate  string
	Requirements []int
}

func mapTreeToNodeModelArray(node *node, visited map[*node]bool) []nodeModel {
	if visited[node] {
		return []nodeModel{}
	}

	visited[node] = true

	var result = make([]nodeModel, 0)
	result = append(result, mapNodeToNodeModel(node))

	for _, requirement := range node.requirements {
		result = append(result, mapTreeToNodeModelArray(requirement, visited)...)
	}

	return result
}

func mapNodeToNodeModel(node *node) nodeModel {
	var child = node.requirements
	var childIds = make([]int, 0)

	for _, children := range child {
		childIds = append(childIds, children.id)
	}

	var model = nodeModel{
		Id:           node.id,
		Name:         node.name,
		Version:      node.version,
		Size:         node.size,
		InstallDate:  node.installDate,
		Requirements: childIds,
	}

	return model
}

func serializeNodeToJson(root *node) string {
	var nodeModel = mapTreeToNodeModelArray(root, make(map[*node]bool))
	var bytes, err = json.MarshalIndent(nodeModel, "", "  ")

	if err != nil {
		fmt.Printf("error while marshalling node %s", err.Error())
		return err.Error()
	}

	return string(bytes)
}

package go_module_analyzer

import (
	"encoding/json"
	"fmt"
	"golang.org/x/mod/modfile"
	"os"
	"path/filepath"
)

type ExternalModule struct {
	Name    string
	Version string
}

type Module struct {
	Name       string
	Version    string
	Deprecated string
	Require    []ExternalModule
	Exclude    []ExternalModule
}

func GetModules(root string) []Module {
	var modFilePaths []string

	err := filepath.Walk(root,
		func(path string, info os.FileInfo, err error) error {
			if info.IsDir() {
				return nil
			}
			if err != nil {
				return err
			}

			if info.Name() == "go.mod" {
				modFilePaths = append(modFilePaths, path)
			}

			return nil
		})

	if err != nil {
		panic(err)
	}

	if modFilePaths == nil {
		return nil
	}

	var modules []Module
	for _, file := range modFilePaths {
		modules = append(modules, getModuleInfo(file))
	}

	return modules
}

func getModuleInfo(path string) Module {
	dat, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}

	f, err := modfile.Parse("go.mod", dat, nil)
	if err != nil {
		panic(err)
	}

	moduleName := f.Module.Mod.Path
	moduleVersion := f.Module.Mod.Version
	moduleDeprecated := f.Module.Deprecated

	var require []ExternalModule
	for _, element := range f.Require {
		require = append(require, ExternalModule{
			Name:    element.Mod.Path,
			Version: element.Mod.Version,
		})
	}

	var exclude []ExternalModule
	for _, element := range f.Exclude {
		require = append(require, ExternalModule{
			Name:    element.Mod.Path,
			Version: element.Mod.Version,
		})
	}

	return Module{
		Name:       moduleName,
		Version:    moduleVersion,
		Deprecated: moduleDeprecated,
		Require:    require,
		Exclude:    exclude,
	}
}

func Print(modules []Module) {
	fmt.Println(serializeToJson(modules))
}

func serializeToJson(modules []Module) string {
	var bytes, err = json.MarshalIndent(modules, "", "  ")

	if err != nil {
		fmt.Printf("error while marshalling node %s", err.Error())
		return err.Error()
	}

	return string(bytes)
}

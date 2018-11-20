package cmd

import (
	"log"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"

	"<%- repopath %>/pkg/controller"
)

var kubeconfig string

// controllerCmd represents the reporter command
var controllerCmd = &cobra.Command{
	Use:   "controller",
	Short: "A brief description of your command",
	Long: `A longer description that spans multiple lines and likely contains examples
and usage of using your command. For example:
Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	Run: run,
}

func init() {
	rootCmd.AddCommand(controllerCmd)

	// pass in kubeconfig, default is set to $HOME/.kube/config
	controllerCmd.Flags().StringVar(&kubeconfig, "kubeconfig", filepath.Join(homeDir(), ".kube", "config"), "kubeconfig location")
}

func run(cmd *cobra.Command, args []string) {
	// use the current context in kubeconfig
	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		panic(err.Error())
	}

	// create clientset
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}

	// set up signals so we handle the first shutdown signal gracefully
	stopCh := make(chan struct{})

	// create controller
	controller := controller.NewController(clientset)

	if err = controller.Run(2, stopCh); err != nil {
		log.Fatalf("Error running controller: %s", err.Error())
	}
}

func homeDir() string {
	if h := os.Getenv("HOME"); h != "" {
		return h
	}
	return os.Getenv("USERPROFILE") // windows
}

package cmd

import (
	"log"

	"github.com/spf13/cobra"
)

// subcommandCmd represents the reporter command
var subcommandCmd = &cobra.Command{
	Use:   "subcommand",
	Short: "A brief description of your command",
	Long: `A longer description that spans multiple lines and likely contains examples
and usage of using your command. For example:
Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	Run: run,
}

func init() {
	rootCmd.AddCommand(subcommandCmd)
}

func run(cmd *cobra.Command, args []string) {
	log.Println("subcommand called")
}

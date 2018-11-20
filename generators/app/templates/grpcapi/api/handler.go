package api

import (
	"log"

	context "golang.org/x/net/context"
)

// Server represents the gRPC server
type Server struct{}

// SayHello generates the response
func (s *Server) SayHello(ctx context.Context, in *PingMessage) (*PingMessage, error) {
	log.Printf("Receive message %s", in.Greeting)
	return &PingMessage{Greeting: "ack"}, nil
}

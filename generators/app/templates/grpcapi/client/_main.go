package main

import (
	"context"
	"log"

	"<%- packagepath %>/<%- projectname %>/api"
	"google.golang.org/grpc"
)

func main() {
	var conn *grpc.ClientConn

	conn, err := grpc.Dial(":7777", grpc.WithInsecure())
	if err != nil {
		log.Fatalf("did not connect: %s", err)
	}
	defer conn.Close()

	c := api.NewPingClient(conn)

	response, err := c.SayHello(context.Background(), &api.PingMessage{Greeting: "halp!"})
	if err != nil {
		log.Fatalf("error when calling SayHello: %s", err)
	}

	log.Printf("response from server: %s", response.Greeting)
}

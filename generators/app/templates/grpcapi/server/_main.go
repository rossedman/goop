package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"

	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	"<%- packagepath %>/<%- projectname %>/api"
	"google.golang.org/grpc"
)

func main() {
	grpcAddress := fmt.Sprintf("%s:%d", "localhost", 7777)
	restAddress := fmt.Sprintf("%s:%d", "localhost", 7778)

	go func() {
		err := startGRPCServer(grpcAddress)
		if err != nil {
			log.Fatalf("failed to start grpc server: %s", err)
		}
	}()

	go func() {
		err := startRESTServer(restAddress, grpcAddress)
		if err != nil {
			log.Fatalf("failed to start http server: %s", err)
		}
	}()

	log.Printf("entering loop...")
	select {}
}

func startGRPCServer(address string) error {
	// create a listener on port 7777 for grpc
	lis, err := net.Listen("tcp", address)
	if err != nil {
		return fmt.Errorf("failed to listen: %v", err)
	}

	// create a server instance
	s := api.Server{}

	// create a grpc server object
	grpcServer := grpc.NewServer()

	// attach the Ping service to the server
	api.RegisterPingServer(grpcServer, &s)

	// start the server
	if err := grpcServer.Serve(lis); err != nil {
		return fmt.Errorf("failed to serve: %v", err)
	}

	return nil
}

func startRESTServer(address string, grpcAddress string) error {
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	mux := runtime.NewServeMux()

	opts := []grpc.DialOption{grpc.WithInsecure()}

	err := api.RegisterPingHandlerFromEndpoint(ctx, mux, grpcAddress, opts)
	if err != nil {
		return fmt.Errorf("could not register service: %s", err)
	}

	log.Printf("starting HTTP/1.1 REST server on %s", address)

	http.ListenAndServe(address, mux)

	return nil
}

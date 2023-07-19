package main

import (
	"context"
	"log"
	"net"

	puddle "github.com/jackc/puddle/v2"
)

func main() {
	constructor := func(context.Context) (net.Conn, error) {
		return net.Dial("tcp", "127.0.0.1:8080")
	}
	destructor := func(value net.Conn) {
		value.Close()
	}
	maxPoolSize := int32(10)

	pool, err := puddle.NewPool(&puddle.Config[net.Conn]{Constructor: constructor, Destructor: destructor, MaxSize: maxPoolSize})
	if err != nil {
		log.Fatal(err)
	}

	// Acquire resource from the pool.
	res, err := pool.Acquire(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	// Use resource.
	_, err = res.Value().Write([]byte{1})
	if err != nil {
		log.Fatal(err)
	}

	// Release when done.
	res.Release()
}

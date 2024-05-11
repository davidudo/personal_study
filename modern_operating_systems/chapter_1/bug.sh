#!/bin/bash

create_child_processes() {
    local count=$1
    if [ $count -gt 0 ]; then
        (sleep 1; create_children $((count-1))) &
        # Wait for the child process to finish
        wait
    fi
}

create_child_processes 100000000000

#!/bin/bash

# Load environment variables from config folder
export $(cat config/.env.development | xargs)

# Run prisma command with loaded environment
npx prisma "$@"

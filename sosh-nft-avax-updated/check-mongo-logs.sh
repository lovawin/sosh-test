#!/bin/bash

# MongoDB query to find ownership-related logs
QUERY='db.marketplace_logs.find({
  $or: [
    { type: "OWNERSHIP_CHECK" },
    { type: "TOKEN_OWNERSHIP_CHECK" },
    { type: "OWNERSHIP_CHECK_RESULT" },
    { type: "OWNERSHIP_CHECK_ERROR" },
    { type: "DATA_PROPERTY_VALIDATION" },
    { message: { $regex: "currentOwner", $options: "i" } },
    { message: { $regex: "isMarketplaceOwner", $options: "i" } }
  ]
}).sort({ timestamp: -1 }).limit(20).pretty()'

# Execute the query in the MongoDB container
echo "Executing MongoDB query..."
ssh -i "../taurien" taurien@3.216.178.231 "sudo docker exec sosh-mongo-db mongo --quiet --eval \"$QUERY\" > /tmp/marketplace-logs.json"

# Copy the logs back to local machine
echo "Copying logs from server..."
scp -i "../taurien" taurien@3.216.178.231:/tmp/marketplace-logs.json ./marketplace-logs.json

echo "Logs saved to marketplace-logs.json"

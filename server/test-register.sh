#!/bin/bash

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "testuser@example.com",
    "password": "test1234",
    "role": "talent",
    "phone": "1234567890"
  }'

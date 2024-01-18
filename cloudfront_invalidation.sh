#!/bin/bash

# Usage: ./cloudfront_invalidation.sh <distribution_id> <release_file>

# This script invalidates a specific file in an AWS CloudFront distribution.
# It's used as part of the deployment process to ensure that the latest version
# of the file is served to users, bypassing any cached versions at CloudFront's edge locations.


DISTRIBUTION_ID=$1
if [[ ! "$DISTRIBUTION_ID" ]]; then echo "Missing DISTRIBUTION_ID"; exit 1; fi

RELEASE_FILE=$2
if [[ ! -f output/"$RELEASE_FILE" ]]; then echo "$RELEASE_FILE does not exist"; exit 1; fi

MAX_ATTEMPTS=300  # Define a constant for the maximum number of attempts

echo "Creating CloudFront invalidation for $RELEASE_FILE in distribution $DISTRIBUTION_ID"
# Run and check if the aws command was successful
if ! INVALIDATION_ID=$(aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/$RELEASE_FILE" --query 'Invalidation.[Id]' --output text); then
    echo "Failed to create CloudFront invalidation"
    exit 1
fi
echo "Invalidation ID: $INVALIDATION_ID"

for ((i = 0 ; i <= MAX_ATTEMPTS ; i++)); do
    INVALIDATION_STATUS=$(aws cloudfront get-invalidation --distribution-id "$DISTRIBUTION_ID" --id "$INVALIDATION_ID" --query 'Invalidation.[Status]' --output text)
    echo "Invalidation status of cloudfront_id $DISTRIBUTION_ID is $INVALIDATION_STATUS"
    if [ "$INVALIDATION_STATUS" == "Completed" ]; then
        echo "Invalidation status is completed; Validate your changes"
        break
    fi
    if [ $i -eq $MAX_ATTEMPTS ]; then
        echo "Invalidation status of cloudfront_id $DISTRIBUTION_ID is $INVALIDATION_STATUS; Validation took longer than expected...could be a problem with AWS API/service"
        exit 1
    fi
    sleep 1
done
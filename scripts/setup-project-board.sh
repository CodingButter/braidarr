#!/bin/bash

# Script to configure GitHub Project board for Braidarr
# Requires: gh CLI with project permissions

echo "Setting up Braidarr Development Project Board..."

# First, ensure we have the right permissions
echo "Checking GitHub CLI permissions..."
if ! gh auth status | grep -q "project"; then
    echo "Error: GitHub CLI needs project permissions."
    echo "Please run: gh auth refresh -s project,read:project,write:org"
    echo "Or manually grant permissions at: https://github.com/settings/tokens"
    exit 1
fi

# Get the project number (you'll need to update this after manual creation)
PROJECT_NUMBER=1  # Update this with your actual project number

# Get all existing issues
echo "Fetching existing issues..."
ISSUES=$(gh issue list --repo CodingButter/braidarr --json number --limit 100 | jq -r '.[].number')

# Add each issue to the project
echo "Adding issues to project board..."
for ISSUE_NUM in $ISSUES; do
    echo "Adding issue #$ISSUE_NUM to project..."
    gh project item-add $PROJECT_NUMBER --owner CodingButter --url https://github.com/CodingButter/braidarr/issues/$ISSUE_NUM
done

echo "Project board setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to your project board at https://github.com/users/CodingButter/projects/$PROJECT_NUMBER"
echo "2. Configure automation rules in the project settings"
echo "3. Set up custom fields as needed"
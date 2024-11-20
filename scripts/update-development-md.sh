#!/bin/bash

# Path to DEVELOPMENT.md
DEV_MD="/Users/chrisgscott/projects/launchlab/docs/technical/DEVELOPMENT.md"

# Function to get current git branch
get_current_branch() {
    git rev-parse --abbrev-ref HEAD
}

# Function to get recent changes
get_recent_changes() {
    git log -n 5 --pretty=format:"- %s"
}

# Function to update section in file
update_section() {
    local section=$1
    local content=$2
    local start_marker="### $section"
    local end_marker="###"
    
    # Create temporary file
    temp_file=$(mktemp)
    
    # Process the file
    awk -v start="$start_marker" -v end="$end_marker" -v content="$content" '
    {
        if ($0 ~ start) {
            print $0
            print ""
            split(content, items, ",")
            for (i in items) {
                if (items[i] != "") {
                    print "- " items[i]
                }
            }
            print ""
            found_start = 1
            next
        }
        if (found_start) {
            if ($0 ~ /^###/) {
                found_start = 0
                print $0
            }
            next
        }
        print $0
    }
    ' "$DEV_MD" > "$temp_file"
    
    # Replace original file with updated content
    mv "$temp_file" "$DEV_MD"
}

# Main update function
update_development_md() {
    clear
    echo "🚀 LaunchLab DEVELOPMENT.md Update Tool 🚀"
    echo "----------------------------------------"
    
    # Current branch
    CURRENT_BRANCH=$(get_current_branch)
    echo "Current Branch: $CURRENT_BRANCH"
    
    # Recent changes
    echo -e "\nRecent Changes:"
    get_recent_changes
    
    # Prompt for updates
    echo -e "\nEnter updates (comma-separated, or press Enter to skip):"
    read -p "Recent Changes: " CHANGES
    read -p "Active Features: " FEATURES
    read -p "Known Issues: " ISSUES
    read -p "Next Steps: " NEXT_STEPS
    
    # Development Focus updates
    echo -e "\nCurrent Development Focus:"
    echo "Enter details for each focus area (or press Enter to skip)"
    read -p "Focus Area Name: " FOCUS_NAME
    if [ ! -z "$FOCUS_NAME" ]; then
        read -p "Status: " FOCUS_STATUS
        read -p "Priority: " FOCUS_PRIORITY
        read -p "Dependencies: " FOCUS_DEPS
        read -p "Notes: " FOCUS_NOTES
        
        FOCUS_CONTENT="- **$FOCUS_NAME**\n  - Status: $FOCUS_STATUS\n  - Priority: $FOCUS_PRIORITY\n  - Dependencies: $FOCUS_DEPS\n  - Notes: $FOCUS_NOTES"
        update_section "Current Development Focus" "$FOCUS_CONTENT"
    fi
    
    # Backup current file
    cp "$DEV_MD" "${DEV_MD}.bak"
    
    # Update sections
    [ ! -z "$CHANGES" ] && update_section "Recent Changes" "$CHANGES"
    [ ! -z "$FEATURES" ] && update_section "Active Features" "$FEATURES"
    [ ! -z "$ISSUES" ] && update_section "Known Issues" "$ISSUES"
    [ ! -z "$NEXT_STEPS" ] && update_section "Next Steps" "$NEXT_STEPS"
    
    # Update last modified date
    sed -i '' "s/Last Updated: .*/Last Updated: $(date '+%Y-%m-%d')/" "$DEV_MD"
    
    echo -e "\n✅ DEVELOPMENT.md updated successfully!"
}

# Run the update
update_development_md

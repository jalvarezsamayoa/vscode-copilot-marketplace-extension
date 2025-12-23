#!/bin/bash

################################################################################
# Script: squash-and-merge.sh
# Purpose: Squash current branch, merge to main, and delete feature branch
#
# This script automates the workflow of squashing a feature branch, merging it
# to main, and cleaning up the feature branch. It includes validation, error
# handling, and confirmation prompts for safety.
#
# Usage: ./scripts/squash-and-merge.sh [OPTIONS]
#
# Options:
#   -h, --help         Show this help message
#   -f, --force        Skip confirmation prompts
#   -b, --branch NAME  Specify feature branch name (defaults to current branch)
#
# Examples:
#   ./scripts/squash-and-merge.sh
#   ./scripts/squash-and-merge.sh --force
#   ./scripts/squash-and-merge.sh --branch feature/my-feature
#
################################################################################

set -euo pipefail

# Constants
readonly SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"
readonly MAIN_BRANCH="main"
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[1;33m'
readonly COLOR_BLUE='\033[0;34m'
readonly COLOR_NC='\033[0m' # No Color

# Global variables
FEATURE_BRANCH=""
FORCE_MODE=false
CURRENT_BRANCH=""

################################################################################
# Functions
################################################################################

# Print colored output
print_info() {
    echo -e "${COLOR_BLUE}ℹ${COLOR_NC} $*"
}

print_success() {
    echo -e "${COLOR_GREEN}✓${COLOR_NC} $*"
}

print_warning() {
    echo -e "${COLOR_YELLOW}⚠${COLOR_NC} $*"
}

print_error() {
    echo -e "${COLOR_RED}✗${COLOR_NC} $*" >&2
}

# Print usage information
show_usage() {
    cat << "EOF"
Usage: squash-and-merge.sh [OPTIONS]

Squash current branch, merge to main, and delete feature branch.

Options:
  -h, --help         Show this help message
  -f, --force        Skip confirmation prompts
  -b, --branch NAME  Specify feature branch name (defaults to current branch)

Examples:
  ./scripts/squash-and-merge.sh
  ./scripts/squash-and-merge.sh --force
  ./scripts/squash-and-merge.sh --branch feature/my-feature

EOF
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                show_usage
                exit 0
                ;;
            -f|--force)
                FORCE_MODE=true
                shift
                ;;
            -b|--branch)
                if [[ -z "${2:-}" ]]; then
                    print_error "Option --branch requires a branch name"
                    exit 1
                fi
                FEATURE_BRANCH="$2"
                shift 2
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# Validate prerequisites
validate_prerequisites() {
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "git is not installed or not in PATH"
        exit 1
    fi

    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi

    # Check if main branch exists
    if ! git show-ref --quiet --verify "refs/heads/${MAIN_BRANCH}"; then
        print_error "Main branch '${MAIN_BRANCH}' does not exist"
        exit 1
    fi
}

# Get current branch name
get_current_branch() {
    git rev-parse --abbrev-ref HEAD
}

# Check if working directory is clean
check_working_directory_clean() {
    if ! git diff-index --quiet HEAD --; then
        print_error "Working directory has uncommitted changes"
        print_info "Please commit or stash your changes before proceeding"
        exit 1
    fi
}

# Confirm action with user
confirm_action() {
    local message="$1"

    if [[ "${FORCE_MODE}" == true ]]; then
        return 0
    fi

    local response
    echo -n -e "${COLOR_YELLOW}?${COLOR_NC} ${message} (y/n) "
    read -r response

    if [[ "${response}" != "y" && "${response}" != "Y" ]]; then
        print_warning "Operation cancelled by user"
        return 1
    fi

    return 0
}

# Verify feature branch is ahead of main
verify_branch_ahead() {
    local feature_commit
    local main_commit

    feature_commit=$(git rev-parse "${FEATURE_BRANCH}")
    main_commit=$(git rev-parse "${MAIN_BRANCH}")

    if [[ "${feature_commit}" == "${main_commit}" ]]; then
        print_warning "Feature branch is at the same commit as main branch"
        if ! confirm_action "Continue anyway?"; then
            exit 1
        fi
    fi
}

# Display summary of changes
display_changes_summary() {
    local commit_count
    commit_count=$(git log "${MAIN_BRANCH}..${FEATURE_BRANCH}" --oneline | wc -l)

    print_info "Summary of changes:"
    print_info "  Feature branch: ${FEATURE_BRANCH}"
    print_info "  Target branch: ${MAIN_BRANCH}"
    print_info "  Commits to squash: ${commit_count}"
    echo
    print_info "Commits to be squashed:"
    git log "${MAIN_BRANCH}..${FEATURE_BRANCH}" --oneline | sed 's/^/    /'
    echo
}

# Perform squash and merge
perform_squash_merge() {
    print_info "Switching to ${MAIN_BRANCH} branch..."
    git checkout "${MAIN_BRANCH}"

    print_info "Squashing and merging ${FEATURE_BRANCH}..."
    git merge --squash "${FEATURE_BRANCH}"

    print_info "Creating commit for squashed changes..."
    if ! git commit --quiet; then
        print_error "Failed to create commit"
        print_info "You may need to manually resolve this issue"
        exit 1
    fi

    print_success "Successfully merged ${FEATURE_BRANCH} into ${MAIN_BRANCH}"
}

# Delete feature branch
delete_feature_branch() {
    print_info "Deleting feature branch ${FEATURE_BRANCH}..."

    # Try normal delete first
    if git branch -d "${FEATURE_BRANCH}" 2>/dev/null; then
        print_success "Deleted feature branch: ${FEATURE_BRANCH}"
        return 0
    fi

    # If normal delete fails, use force delete
    print_warning "Normal delete failed, using force delete"
    if git branch -D "${FEATURE_BRANCH}" 2>/dev/null; then
        print_success "Force deleted feature branch: ${FEATURE_BRANCH}"
        return 0
    fi

    print_error "Failed to delete feature branch: ${FEATURE_BRANCH}"
    exit 1
}

# Display final summary
display_final_summary() {
    echo
    print_success "Squash and merge completed successfully!"
    echo
    print_info "Final status:"
    echo "  Current branch: $(get_current_branch)"
    echo "  Branch status:"
    git branch -vv | grep -E "(^\*|${MAIN_BRANCH})" | sed 's/^/    /'
    echo
    print_info "You can now push your changes:"
    echo "    git push origin ${MAIN_BRANCH}"
}

################################################################################
# Main Script
################################################################################

main() {
    parse_arguments "$@"

    validate_prerequisites

    # Get current branch if not specified
    CURRENT_BRANCH=$(get_current_branch)
    if [[ -z "${FEATURE_BRANCH}" ]]; then
        FEATURE_BRANCH="${CURRENT_BRANCH}"
    fi

    # Validate branch name
    if [[ "${FEATURE_BRANCH}" == "${MAIN_BRANCH}" ]]; then
        print_error "Cannot squash and merge main branch into itself"
        exit 1
    fi

    # Check if feature branch exists
    if ! git show-ref --quiet --verify "refs/heads/${FEATURE_BRANCH}"; then
        print_error "Feature branch '${FEATURE_BRANCH}' does not exist"
        exit 1
    fi

    print_info "Starting squash and merge workflow..."
    echo

    check_working_directory_clean
    verify_branch_ahead
    display_changes_summary

    if ! confirm_action "Proceed with squash and merge?"; then
        exit 1
    fi

    echo
    perform_squash_merge
    delete_feature_branch

    display_final_summary
}

# Run main function
main "$@"

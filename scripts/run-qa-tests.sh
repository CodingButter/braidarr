#!/bin/bash

# Braidarr QA Testing Script
# Comprehensive testing suite for arr ecosystem application
# QA Engineer: Claude Code

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
QA_PORTS_START=3300
QA_PORTS_END=3399
WEB_PORT=3300
API_PORT=3301
DB_PORT=3302
WEBSOCKET_PORT=3303

# Print colored output
print_status() {
    echo -e "${BLUE}[QA]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}======================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}======================================${NC}\n"
}

# Check if required tools are installed
check_dependencies() {
    print_header "Checking Dependencies"
    
    local missing_deps=()
    
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    if ! command -v playwright &> /dev/null; then
        missing_deps+=("playwright")
    fi
    
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install missing dependencies and try again"
        exit 1
    fi
    
    print_success "All dependencies found"
}

# Check if ports are available
check_ports() {
    print_header "Checking Port Availability"
    
    local ports=($WEB_PORT $API_PORT $DB_PORT $WEBSOCKET_PORT)
    local occupied_ports=()
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            occupied_ports+=($port)
        fi
    done
    
    if [ ${#occupied_ports[@]} -ne 0 ]; then
        print_warning "Ports already in use: ${occupied_ports[*]}"
        print_status "Attempting to kill processes on occupied ports..."
        
        for port in "${occupied_ports[@]}"; do
            local pids=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null || true)
            if [ -n "$pids" ]; then
                echo "Killing processes on port $port: $pids"
                kill -9 $pids 2>/dev/null || true
                sleep 2
            fi
        done
    fi
    
    print_success "Ports are available for testing"
}

# Setup test environment
setup_test_environment() {
    print_header "Setting Up Test Environment"
    
    # Create test results directory
    mkdir -p test-results
    
    # Setup test database
    print_status "Setting up test database..."
    if docker ps -a --format 'table {{.Names}}' | grep -q braidarr-test-db; then
        print_status "Stopping existing test database..."
        docker stop braidarr-test-db 2>/dev/null || true
        docker rm braidarr-test-db 2>/dev/null || true
    fi
    
    print_status "Starting test database on port $DB_PORT..."
    docker run -d \
        --name braidarr-test-db \
        -e POSTGRES_USER=test \
        -e POSTGRES_PASSWORD=test \
        -e POSTGRES_DB=braidarr_test \
        -p $DB_PORT:5432 \
        postgres:15
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Install dependencies if needed
    print_status "Installing dependencies..."
    npm install
    
    # Install Playwright browsers
    print_status "Installing Playwright browsers..."
    npx playwright install
    
    # Run database migrations for test environment
    print_status "Running database migrations..."
    cd packages/server
    DATABASE_URL="postgresql://test:test@localhost:$DB_PORT/braidarr_test" npx prisma migrate deploy
    cd ../..
    
    print_success "Test environment setup complete"
}

# Run security tests (critical priority)
run_security_tests() {
    print_header "Running Security Tests (CRITICAL)"
    
    print_status "Testing registration endpoint removal..."
    npx playwright test --config=playwright.config.qa.ts --project=security-tests
    
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        print_error "Security tests FAILED - CRITICAL ISSUES FOUND"
        print_error "Registration functionality must be removed before proceeding"
        return $exit_code
    fi
    
    print_success "Security tests completed"
}

# Run API authentication tests
run_api_tests() {
    print_header "Running API Authentication Tests"
    
    print_status "Testing API key authentication flows..."
    npx playwright test --config=playwright.config.qa.ts --project=api-tests
    
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        print_error "API tests FAILED"
        return $exit_code
    fi
    
    print_success "API tests completed"
}

# Run arr ecosystem integration tests
run_arr_ecosystem_tests() {
    print_header "Running Arr Ecosystem Integration Tests"
    
    print_status "Testing Sonarr/Radarr integrations..."
    npx playwright test --config=playwright.config.qa.ts --project=arr-ecosystem-tests
    
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        print_warning "Arr ecosystem tests had failures (expected for incomplete integrations)"
    else
        print_success "Arr ecosystem tests completed"
    fi
    
    return 0  # Don't fail overall suite for integration tests
}

# Run UI tests
run_ui_tests() {
    print_header "Running UI Tests"
    
    print_status "Testing user interface components..."
    npx playwright test --config=playwright.config.qa.ts --project=ui-tests
    
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        print_error "UI tests FAILED"
        return $exit_code
    fi
    
    print_success "UI tests completed"
}

# Run cross-browser tests
run_cross_browser_tests() {
    print_header "Running Cross-Browser Tests"
    
    print_status "Testing across different browsers..."
    npx playwright test --config=playwright.config.qa.ts \
        --project=cross-browser-chrome \
        --project=cross-browser-firefox \
        --project=cross-browser-safari
    
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        print_warning "Cross-browser tests had failures"
    else
        print_success "Cross-browser tests completed"
    fi
    
    return 0  # Don't fail for cross-browser issues
}

# Run performance tests
run_performance_tests() {
    print_header "Running Performance Tests"
    
    print_status "Testing application performance..."
    npx playwright test --config=playwright.config.qa.ts --project=performance-tests
    
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        print_warning "Performance tests had failures"
    else
        print_success "Performance tests completed"
    fi
    
    return 0  # Don't fail for performance issues
}

# Run mobile tests
run_mobile_tests() {
    print_header "Running Mobile Tests"
    
    print_status "Testing mobile responsiveness..."
    npx playwright test --config=playwright.config.qa.ts \
        --project=mobile-android \
        --project=mobile-ios
    
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        print_warning "Mobile tests had failures"
    else
        print_success "Mobile tests completed"
    fi
    
    return 0  # Don't fail for mobile issues
}

# Generate test reports
generate_reports() {
    print_header "Generating Test Reports"
    
    print_status "Generating Playwright HTML report..."
    npx playwright show-report --host 0.0.0.0 --port 9323 &
    local report_pid=$!
    
    print_status "HTML report available at: http://localhost:9323"
    print_status "Report PID: $report_pid (kill when done viewing)"
    
    # Generate custom QA report
    if [ -f test-results/results.json ]; then
        print_status "Test results available in test-results/ directory"
        print_status "QA summary available in test-results/QA_EXECUTION_SUMMARY.md"
    fi
    
    print_success "Reports generated"
}

# Cleanup test environment
cleanup_test_environment() {
    print_header "Cleaning Up Test Environment"
    
    # Stop test database
    print_status "Stopping test database..."
    docker stop braidarr-test-db 2>/dev/null || true
    docker rm braidarr-test-db 2>/dev/null || true
    
    # Kill any remaining processes on test ports
    for port in $(seq $QA_PORTS_START $QA_PORTS_END); do
        local pids=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null || true)
        if [ -n "$pids" ]; then
            kill -9 $pids 2>/dev/null || true
        fi
    done
    
    print_success "Cleanup complete"
}

# Main test execution
main() {
    local start_time=$(date +%s)
    local failed_tests=()
    
    print_header "Braidarr QA Testing Suite"
    print_status "QA Engineer: Claude Code"
    print_status "Test Environment: Ports $QA_PORTS_START-$QA_PORTS_END"
    print_status "Start Time: $(date)"
    
    # Trap cleanup on exit
    trap cleanup_test_environment EXIT
    
    # Pre-flight checks
    check_dependencies
    check_ports
    
    # Setup
    setup_test_environment
    
    # Run test suites in priority order
    print_status "Running test suites in priority order..."
    
    # 1. CRITICAL: Security tests must pass
    if ! run_security_tests; then
        failed_tests+=("Security")
        print_error "CRITICAL: Security tests failed - stopping execution"
        print_error "Registration endpoints must be removed before continuing"
        exit 1
    fi
    
    # 2. HIGH: API authentication tests
    if ! run_api_tests; then
        failed_tests+=("API Authentication")
    fi
    
    # 3. HIGH: UI tests
    if ! run_ui_tests; then
        failed_tests+=("UI")
    fi
    
    # 4. MEDIUM: Arr ecosystem tests (may fail due to incomplete implementation)
    run_arr_ecosystem_tests
    
    # 5. MEDIUM: Cross-browser tests
    run_cross_browser_tests
    
    # 6. LOW: Performance tests
    run_performance_tests
    
    # 7. LOW: Mobile tests
    run_mobile_tests
    
    # Generate reports
    generate_reports
    
    # Summary
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    print_header "Test Execution Summary"
    print_status "Total Duration: ${duration}s"
    print_status "End Time: $(date)"
    
    if [ ${#failed_tests[@]} -eq 0 ]; then
        print_success "All critical tests passed!"
        print_status "Status: ✅ READY FOR NEXT PHASE"
    else
        print_error "Failed test suites: ${failed_tests[*]}"
        print_status "Status: ❌ REQUIRES FIXES"
        
        # Don't exit with error for non-critical failures
        if [[ " ${failed_tests[@]} " =~ " Security " ]]; then
            exit 1
        fi
    fi
    
    print_status "Detailed results available in test-results/"
    print_status "HTML report: http://localhost:9323"
}

# Script arguments handling
case "${1:-all}" in
    "security")
        check_dependencies
        check_ports
        setup_test_environment
        run_security_tests
        cleanup_test_environment
        ;;
    "api")
        check_dependencies
        check_ports
        setup_test_environment
        run_api_tests
        cleanup_test_environment
        ;;
    "ui")
        check_dependencies
        check_ports
        setup_test_environment
        run_ui_tests
        cleanup_test_environment
        ;;
    "arr")
        check_dependencies
        check_ports
        setup_test_environment
        run_arr_ecosystem_tests
        cleanup_test_environment
        ;;
    "performance")
        check_dependencies
        check_ports
        setup_test_environment
        run_performance_tests
        cleanup_test_environment
        ;;
    "mobile")
        check_dependencies
        check_ports
        setup_test_environment
        run_mobile_tests
        cleanup_test_environment
        ;;
    "all")
        main
        ;;
    "help"|"-h"|"--help")
        echo "Braidarr QA Testing Script"
        echo "Usage: $0 [test-suite]"
        echo ""
        echo "Test Suites:"
        echo "  all          Run all test suites (default)"
        echo "  security     Run security tests only (CRITICAL)"
        echo "  api          Run API authentication tests"
        echo "  ui           Run UI tests"
        echo "  arr          Run arr ecosystem integration tests"
        echo "  performance  Run performance tests"
        echo "  mobile       Run mobile responsiveness tests"
        echo "  help         Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 all              # Run complete test suite"
        echo "  $0 security         # Run only security tests"
        echo "  $0 api             # Run only API tests"
        ;;
    *)
        print_error "Unknown test suite: $1"
        print_status "Use '$0 help' for available options"
        exit 1
        ;;
esac
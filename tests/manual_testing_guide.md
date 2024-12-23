# M3Unator Manual Testing Guide

This document outlines the manual testing procedures for the M3Unator userscript.

## UI Tests

### 1. Modal Window
- Click the M3Unator button
- Verify that the modal window appears
- Check if the modal has all necessary elements (directory input, options, buttons)
- Verify that the close button works

### 2. Theme Toggle
- Check if the default theme is applied correctly
- Toggle between light/dark themes if implemented
- Verify that all UI elements are visible in both themes

### 3. Progress Bar
- Start a directory scan
- Verify that the progress bar updates
- Check if the percentage is displayed correctly

## File Operations Tests

### 1. Directory Scanning
- Select a directory with video files
- Verify that scanning starts
- Check if all media files are detected

### 2. Media File Filtering
- Test with different file types (mp4, mkv, avi, etc.)
- Verify that only supported formats are included
- Check if non-media files are excluded

### 3. M3U Playlist Creation
- Generate a playlist
- Verify the M3U file format is correct
- Check if file paths are properly encoded

## Error Handling Tests

### 1. Invalid Directory
- Try selecting a non-existent directory
- Verify that an appropriate error message is shown

### 2. Permission Errors
- Try accessing a restricted directory
- Check if the error message is clear

### 3. Invalid Files
- Include some corrupted media files
- Verify they are handled gracefully

## Settings Tests

### 1. Save/Load Settings
- Change various settings
- Refresh the page
- Verify settings are preserved

### 2. Default Settings
- Clear saved settings
- Verify default values are applied

## Performance Tests

### 1. Large Directories
- Test with 100+ media files
- Verify the script remains responsive
- Check memory usage doesn't spike

### 2. Different File Types
- Mix of video and audio files
- Various file sizes
- Different file name lengths

## Internationalization Tests

### 1. Non-ASCII Filenames
- Test with files containing special characters
- Verify proper encoding in playlist
- Check if displayed correctly in UI

## User Experience Tests

### 1. Loading States
- Check if loading indicators are shown
- Verify UI is not frozen during operations

### 2. Error Messages
- Verify all error messages are clear
- Check if suggestions for fixes are provided

## How to Use This Guide

1. Go through each test category systematically
2. Create test scenarios with actual files on your system
3. Document any issues found
4. Verify fixes for reported issues

*Note: This is a living document - add new test cases as features are added* 
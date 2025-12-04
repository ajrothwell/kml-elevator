# KML Elevator

A web-based tool for adjusting elevation values in KML files and customizing line appearance.

## Features

- **Elevation Adjustment**: Add or subtract elevation values from all coordinates in LineString elements
- **Color Customization**: Set custom line colors using a hex color picker
- **Floating Lines**: Lines appear at the specified elevation without vertical walls to the ground
- **Multiple LineStrings**: Processes all LineString elements in a KML file
- **Client-Side Processing**: All processing happens in your browser - no server required

## Usage

1. Open `index.html` in a web browser
2. Click "Select KML File" and choose your KML file
3. Enter the elevation adjustment value in meters (positive to raise, negative to lower)
4. Choose a line color (default is white)
5. Click "Process KML"
6. Click "Download Modified KML" to save the result

## How It Works

The tool modifies KML files by:

- Adjusting all coordinate elevations by the specified amount
- Setting `<altitudeMode>` to `absolute` for precise elevation control
- Setting `<extrude>` to `0` to prevent vertical walls from ground to line
- Adding `<Style>` and `<LineStyle>` elements to set line color

## Technical Details

KML color format uses `aabbggrr` (alpha, blue, green, red) instead of standard hex RGB. The tool automatically converts your color selection to the proper format.

## Requirements

- Modern web browser with JavaScript enabled
- No installation or server setup required

## License

Open source - feel free to use and modify as needed.

# Gallery controls

The three opening portraits remain a separate, fixed row at their existing
size. They are excluded from album search, filters, hover previews and the viewer.

The 22 albums can be searched by title, place and event details, filtered by
year and sorted by date, title or photograph count. Search terms combine with
the year filter; Clear filters restores the full collection. Hover previews
are opt-in and disabled when the browser prefers reduced motion.

Select an album to open the viewer. Use Previous / Next, left / right arrow
keys, Home / End, thumbnails or horizontal swipes to navigate. Playback starts
only when requested. Zoom provides a larger, scrollable image. Escape exits
zoom before closing the viewer. Fullscreen is offered in supporting browsers.
Download saves the selected original file. Copy photo link creates a URL such as
`gallery.html#album=mahmuda&photo=2`, which opens that specific photograph.
Album cover selections persist in this browser; they do not alter the public
site for other visitors. Keyboard focus returns to the album when it closes.

Implementation: `js/gallery.js`, page-specific `css/gallery.css`, and the album
data in `gallery.html`. Existing images, captions and dates are preserved.

## Verification

Run `python3 tests/gallery_browser_check.py` with Playwright and Chromium
available. It starts a temporary server and checks search/filter intersections,
empty results, reset, sorting, preserved portrait dimensions, navigation and
wraparound, zoom/Escape, slideshow controls, downloads, copied links, saved
covers, focus restoration and one-photo albums at desktop and mobile widths.
Fullscreen entry/exit, horizontal swipe and hover preview/restoration were also
verified in Chromium during implementation.

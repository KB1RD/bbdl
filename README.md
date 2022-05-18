# Blackboard LMS Downloader

> Adds a download button to Blackboard LMS.

This is a webextension that simply puts a download button on each course of the
course list page.

## Browser Support

* Firefox - Tested, **not working**, likely due to bug in FF
* Chrom(ium) - Tested & working on Brave Browser
* All other browsers untested at the present time

## Legal Disclaimer

This extension is intended to allow students to download content from courses
in which they are currently enrolled. As most course content is covered under
intellecutal property laws of your respective institutions, you should not
redistribute this content, of course, unless you want to get sued. If you are
concerned, double check the rules of your institution before using this
software.

As this software is licensed under the GPL 3.0 (or later) license, the following applies:

     This program is free software: you can redistribute it and/or modify it
     under the terms of the GNU General Public License as published by the Free
     Software Foundation, either version 3 of the License, or (at your option)
     any later version.

    This program is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
    FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along with
    this program. If not, see <https://www.gnu.org/licenses/>. 

## Use

It's pretty simple:

You log in to Blackboard and navigate to your course list

You click Download.

You wait. Sometimes it can take a while depending on how large your course is

When the zip file appears, you open it. That's all!

Information about the course and content from pages is stored in YAML files. If
you see a `.yaml` file, you can open it in a text editor and it's fairly easy
to read. That's where you'll find descriptions for assignments, etc. Files that
come with assignments should all be in their respective directories.

## Installation

More information coming soon

## Building from source

Simply run:

```sh
npm i

npm run build
```

The extension will be in `dist`.


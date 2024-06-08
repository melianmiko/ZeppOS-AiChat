**This proejct is deprecated**, source code published only for reference.

## How-to build

1. Prepare server (see [./server](./server));
2. `cp page/shared/constants.example.ts page/shared/constants.ts`;
3. Fill `page/shared/constants.ts` with server credentials;
4. Install build dependencies: NodeJS & `npm i -g zeusx @zeppos/zeus-cli @zeppos/zpm` (requires root/admin rights);
5. Install project dependencies: in project folder `npm i`;
6. Build it with `zeusx`: `zeusx dev` (run in simulator) / `zeusx preview` (get QR code for real device) / `zeusx build` (create ZAB bundle).

## Thanks

- @yarchefis, author of app icon;
- All crowdin members that helped to translate this application to couple of languages.

## License

    ZeppOS AI Chat application & simple server
    Copyright (C) 2024  MelianMiko

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.


Since now, GPLv3 is also valid for all previous commits in this repository, 
and for all previous releases of AI Chat application.


How-to build:

1. Prepare server (see [./server](./server));
2. `cp page/shared/constants.example.ts page/shared/constants.ts`;
3. Fill `page/shared/constants.ts` with server credentials;
4. Install build dependencies: NodeJS & `npm i -g zeusx @zeppos/zeus-cli @zeppos/zpm` (requires root/admin rights);
5. Install project dependencies: in project folder `npm i`;
6. Build it with `zeusx`: `zeusx dev` (run in simulator) / `zeusx preview` (get QR code for real device) / `zeusx build` (create ZAB bundle).

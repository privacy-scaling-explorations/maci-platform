import { Module } from "@nestjs/common";

import { CryptoModule } from "../crypto/crypto.module";
import { FileModule } from "../file/file.module";

import { SessionKeysController } from "./sessionKeys.controller";
import { SessionKeysService } from "./sessionKeys.service";

@Module({
  imports: [FileModule, CryptoModule],
  controllers: [SessionKeysController],
  providers: [SessionKeysService],
})
export class SessionKeysModule {}

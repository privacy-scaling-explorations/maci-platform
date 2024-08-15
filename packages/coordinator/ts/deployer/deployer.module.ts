import { Module } from "@nestjs/common";

import { CryptoModule } from "../crypto/crypto.module";
import { FileModule } from "../file/file.module";

import { DeployerController } from "./deployer.controller";
// import { DeployerGateway } from "./deployer.gateway";
import { DeployerService } from "./deployer.service";

@Module({
  imports: [FileModule, CryptoModule],
  controllers: [DeployerController],
  providers: [DeployerService],
})
export class DeployerModule {}

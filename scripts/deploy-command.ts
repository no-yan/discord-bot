import { NewCommandDTO, NewCommands, Register } from "../command/index";
import { Ping } from "../command/ping";
import { ValidateEnv } from "../src/env";

const config = ValidateEnv();

const commands = NewCommands(Ping).map(NewCommandDTO);
await Register(commands, config);

import { NewCommandDTO, NewCommands, Register } from "../src/command";
import { Ping } from "../src/command/ping";
import { ValidateEnv } from "../src/env";

const config = ValidateEnv();

const commands = NewCommands(Ping).map(NewCommandDTO);
await Register(commands, config);

import { NewCommandDTO, NewCommands, Register } from "../src/command";
import { ping } from "../src/command/ping";
import { ValidateEnv } from "../src/env";

const config = ValidateEnv();

const commands = NewCommands(ping).map(NewCommandDTO);
await Register(commands, config);

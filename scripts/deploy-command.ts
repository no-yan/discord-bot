import { NewCommandDto, NewCommands, Register } from "../src/command";
import { Ping } from "../src/command/ping";
import { ValidateEnv } from "./env";

const config = ValidateEnv();

const commands = NewCommands(Ping).map(NewCommandDto);
await Register(commands, config);

// biome-ignore lint:
import { NewCommandDto, NewCommands, Ping, Register } from "../src/command";
import { ValidateEnv } from "./env";

const config = ValidateEnv();

const commands = NewCommands(Ping).map(NewCommandDto);
await Register(commands, config);

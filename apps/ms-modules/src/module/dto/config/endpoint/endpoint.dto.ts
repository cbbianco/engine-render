import { IsOptional, IsString } from "class-validator";

export class EndpointDto {
    @IsString() @IsOptional() method?: string;
    @IsString() @IsOptional() uri?: string;
    @IsString() @IsOptional() endpoint?: string;
    @IsString() @IsOptional() backend?: string;
}

import { PartialType, OmitType } from "@nestjs/swagger";
import { CreateCustomerDto } from "./create-customer.dto";

/**
 * All fields optional for PATCH. `business_id` is omitted — a customer cannot be
 * moved to a different business after creation.
 */
export class UpdateCustomerDto extends PartialType(
  OmitType(CreateCustomerDto, ["business_id"] as const),
) {}
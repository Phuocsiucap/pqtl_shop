package org.example.model;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    private String name;
    private String phone;
    private String city;

    @Field("address_ct")
    private String addressct;

    @Field("is_default")
    private Boolean isDefault = false;
}

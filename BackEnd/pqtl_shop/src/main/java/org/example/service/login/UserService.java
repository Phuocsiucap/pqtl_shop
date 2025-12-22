package org.example.service.login;

import lombok.RequiredArgsConstructor;
import org.example.model.Address;
import org.example.model.login.User;
import org.example.repository.login.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ✅ Lấy thông tin người dùng hiện tại
    public User getUser(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        return user.get(); // Lấy user đầu tiên nếu có nhiều
    }

    // ✅ Cập nhật thông tin user
    public User updateUser(String email, User updateData) {
        User user = getUser(email);

        if (updateData.getUsername() != null)
            user.setUsername(updateData.getUsername());
        if (updateData.getUserType() != null)
            user.setUserType(updateData.getUserType());
        if (updateData.getLoyaltyPoints() != null)
            user.setLoyaltyPoints(updateData.getLoyaltyPoints());

        return userRepository.save(user);
    }

    // ✅ Cập nhật mật khẩu
    public User updatePassword(String email, String newPassword) {
        User user = getUser(email);
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    // ✅ Thêm điểm thưởng
    public User addPoints(String email, int score) {
        User user = getUser(email);
        user.setLoyaltyPoints(user.getLoyaltyPoints() + score);
        return userRepository.save(user);
    }

    // ✅ Lấy danh sách địa chỉ
    public List<Address> getAddresses(String email) {
        User user = getUser(email);
        List<Address> addresses = user.getAddresses();
        if (addresses != null) {
            boolean needSave = false;
            for (Address a : addresses) {
                if (a.getId() == null) {
                    a.setId(UUID.randomUUID().toString());
                    needSave = true;
                }
            }
            if (needSave) {
                user.setAddresses(addresses);
                userRepository.save(user);
            }
        }
        return addresses;
    }

    // ✅ Thêm địa chỉ mới
    public Address addAddress(String email, Address newAddress) {
        User user = getUser(email);
        List<Address> addresses = user.getAddresses();
        if (addresses == null) {
            addresses = new java.util.ArrayList<>();
        }

        // Nếu địa chỉ mới là mặc định, bỏ mặc định của các địa chỉ cũ
        if (Boolean.TRUE.equals(newAddress.getIsDefault())) {
            addresses.forEach(a -> a.setIsDefault(false));
        }

        newAddress.setId(UUID.randomUUID().toString());
        addresses.add(newAddress);
        user.setAddresses(addresses);
        userRepository.save(user);
        return newAddress;
    }

    // ✅ Cập nhật địa chỉ
    public Address updateAddress(String email, String addressId, Address updatedAddress) {
        User user = getUser(email);
        List<Address> addresses = user.getAddresses();
        if (addresses != null) {
            for (int i = 0; i < addresses.size(); i++) {
                if (addresses.get(i).getId() != null && addresses.get(i).getId().equals(addressId)) {
                    // Nếu địa chỉ cập nhật là mặc định, bỏ mặc định của các địa chỉ khác
                    if (Boolean.TRUE.equals(updatedAddress.getIsDefault())) {
                        addresses.forEach(a -> a.setIsDefault(false));
                    }
                    updatedAddress.setId(addressId);
                    addresses.set(i, updatedAddress);
                    user.setAddresses(addresses);
                    userRepository.save(user);
                    return updatedAddress;
                }
            }
        }
        return null; // or throw exception
    }

    // ✅ Xóa địa chỉ
    public boolean deleteAddress(String email, String addressId) {
        User user = getUser(email);
        List<Address> addresses = user.getAddresses();
        if (addresses != null) {
            boolean removed = addresses.removeIf(a -> a.getId() != null && a.getId().equals(addressId));
            if (removed) {
                user.setAddresses(addresses);
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }
}

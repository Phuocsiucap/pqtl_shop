package org.example.service.login;

import lombok.RequiredArgsConstructor;
import org.example.model.Address;
import org.example.model.login.User;
import org.example.repository.login.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ✅ Lấy thông tin người dùng hiện tại
    public User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ✅ Cập nhật thông tin user
    public User updateUser(String username, User updateData) {
        User user = getUser(username);

        if (updateData.getUsername() != null)
            user.setUsername(updateData.getUsername());
        if (updateData.getUserType() != null)
            user.setUserType(updateData.getUserType());
        if (updateData.getLoyaltyPoints() != null)
            user.setLoyaltyPoints(updateData.getLoyaltyPoints());

        return userRepository.save(user);
    }

    // ✅ Cập nhật mật khẩu
    public User updatePassword(String username, String newPassword) {
        User user = getUser(username);
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    // ✅ Thêm điểm thưởng
    public User addPoints(String username, int score) {
        User user = getUser(username);
        user.setLoyaltyPoints(user.getLoyaltyPoints() + score);
        return userRepository.save(user);
    }

    // ✅ Lấy danh sách địa chỉ
    public List<Address> getAddresses(String username) {
        return getUser(username).getAddresses();
    }

    // ✅ Thêm địa chỉ mới
    public User addAddress(String username, Address newAddress) {
        User user = getUser(username);
        List<Address> addresses = user.getAddresses();
        if (addresses == null) {
            addresses = new java.util.ArrayList<>();
        }

        // Nếu địa chỉ mới là mặc định, bỏ mặc định của các địa chỉ cũ
        if (Boolean.TRUE.equals(newAddress.getIsDefault())) {
            addresses.forEach(a -> a.setIsDefault(false));
        }

        addresses.add(newAddress);
        user.setAddresses(addresses);
        return userRepository.save(user);
    }
}

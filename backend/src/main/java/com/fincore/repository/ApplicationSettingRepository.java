package com.fincore.repository;

import com.fincore.entity.ApplicationSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationSettingRepository extends JpaRepository<ApplicationSetting, Long> {
    Optional<ApplicationSetting> findBySettingKey(String settingKey);
}

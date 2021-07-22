<?php

/**
 * @copyright Copyright (c) 2021 Nextcloud GmbH
 *
 * @author Carl Schwan <carl@carlschwan.eu>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 */

namespace OCA\AdminRightSubgranting\Service;

use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;

use OCA\AdminRightSubgranting\Db\AuthorizedGroup;
use OCA\AdminRightSubgranting\Db\AuthorizedGroupMapper;
use OCP\DB\Exception;

class AuthorizedGroupService {

	/** @var AuthorizedGroupMapper $mapper */
	private $mapper;

	public function __construct(AuthorizedGroupMapper $mapper) {
		$this->mapper = $mapper;
	}

	public function findAll(): array {
		return $this->mapper->findAll();
	}

	/**
	 * Find AuthorizedNote by id.
	 *
	 * @param int $id
	 */
	public function find(int $id): ?AuthorizedGroup {
		return $this->mapper->find($id);
	}

	/**
	 * @param $e
	 * @throws NotFoundException
	 */
	private function handleException($e) {
		if ($e instanceof DoesNotExistException ||
			$e instanceof MultipleObjectsReturnedException) {
			throw new NotFoundException($e->getMessage());
		} else {
			throw $e;
		}
	}

	/**
	 * Create a new AuthorizedGroup
	 *
	 * @param string $groupId
	 * @param string $class
	 * @return AuthorizedGroup
	 * @throws Exception
	 */
	public function create(string $groupId, string $class): AuthorizedGroup {
		$authorizedGroup = new AuthorizedGroup();
		$authorizedGroup->setGroupId($groupId);
		$authorizedGroup->setClass($class);
		return $this->mapper->insert($authorizedGroup);
	}

	/**
	 * @throws NotFoundException
	 */
	public function delete(int $id): ?AuthorizedGroup {
		try {
			$authorizedGroup = $this->mapper->find($id);
			$this->mapper->delete($authorizedGroup);
			return $authorizedGroup;
		} catch (\Exception $e) {
			$this->handleException($e);
		}
		return null;
	}

	public function findOldGroups(string $class) {
		try {
			$authorizedGroup = $this->mapper->findOldGroups($class);
			return $authorizedGroup;
		} catch (\Exception $e) {
			$this->handleException($e);
		}
		return null;
	}
}
